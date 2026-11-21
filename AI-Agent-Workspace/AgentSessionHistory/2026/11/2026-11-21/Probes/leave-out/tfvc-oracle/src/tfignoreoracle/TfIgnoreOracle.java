package tfignoreoracle;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import com.microsoft.tfs.core.clients.versioncontrol.internal.localworkspace.ExclusionSet;
import com.microsoft.tfs.core.clients.versioncontrol.localworkspace.BaselineFolder;
import com.microsoft.tfs.core.clients.versioncontrol.localworkspace.IgnoreFile;
import com.microsoft.tfs.core.clients.versioncontrol.localworkspace.LocalItemExclusionEvaluator;
import com.microsoft.tfs.core.clients.versioncontrol.path.LocalPath;
import com.microsoft.tfs.core.clients.versioncontrol.soapextensions.WorkingFolder;
import com.microsoft.tfs.core.util.CodePageMapping;
import com.microsoft.tfs.core.util.FileEncoding;
import com.microsoft.tfs.core.util.FileEncodingDetector;

/**
 * Oracle for TFVC .tfignore matching, driving Team Explorer Everywhere's own
 * classes (LocalItemExclusionEvaluator, IgnoreFile, IgnoreEntry, ItemPath,
 * LocalPath, ExclusionSet) compiled unchanged from Microsoft's source.
 *
 * Usage: TfIgnoreOracle <workspaceRoot> [--start <dir>] [--global default|none|<file>]
 *
 * The workspace root is treated as the single working-folder mapping
 * ($/oracle -> root). The evaluator is built exactly as its constructors build
 * it (LocalItemExclusionEvaluator.java lines 102-109 / 123-130), except that
 * the global exclusion list, which the product fetches from the server or its
 * cache, is supplied here: "default" is the product's built-in fallback list
 * (new ExclusionSet(), ExclusionSet.java line 47), "none" is empty, otherwise
 * a file with one exclusion per line, taken verbatim.
 *
 * Output: one tab-separated line per item below the start folder.
 *   kind     file | dir
 *   path     relative to the start folder, '/'-separated
 *   scan     the local-workspace scanner's verdict (LocalWorkspaceScanner.fullScan):
 *            every file is evaluated with isFolder=false, no folder is pruned.
 *            "-" for directories, which the scanner never evaluates.
 *   add      "tf add <start> /recursive" (FileSystemWalker): folders that are
 *            excluded are pruned and never entered. added | excluded |
 *            unreached:<pruned ancestor>
 *   source   the .tfignore (relative to start) or "global" that decided the
 *            scan verdict (for dirs: the isFolder=true verdict), or "-"
 *   line     1-based line in that .tfignore that decided it (see attribute())
 *   rule     the decisive line's text, or the global pattern
 */
public final class TfIgnoreOracle {
    private static String root;
    private static String start;
    private static String[] global;

    public static void main(final String[] args) throws Exception {
        String rootArg = null;
        String startArg = null;
        String globalArg = "default";

        for (int i = 0; i < args.length; i++) {
            if ("--start".equals(args[i])) {
                startArg = args[++i];
            } else if ("--global".equals(args[i])) {
                globalArg = args[++i];
            } else if (rootArg == null) {
                rootArg = args[i];
            } else {
                usage();
            }
        }
        if (rootArg == null) {
            usage();
        }

        root = new File(rootArg).getCanonicalPath();
        start = startArg == null ? root : new File(startArg).getCanonicalPath();

        if ("default".equals(globalArg)) {
            global = new ExclusionSet().getExclusions();
        } else if ("none".equals(globalArg)) {
            global = new String[0];
        } else {
            global = Files.readAllLines(new File(globalArg).toPath()).toArray(new String[0]);
        }

        // Every item below start, top-down (parents before children).
        final List<String> items = new ArrayList<String>();
        final Map<String, Boolean> isDir = new LinkedHashMap<String, Boolean>();
        enumerate(start, items, isDir);

        // Scanner verdicts (files with isFolder=false) and folder verdicts
        // (isFolder=true), from one evaluator driven top-down.
        final LocalItemExclusionEvaluator scanEval = newEvaluator();
        final Map<String, String[]> verdicts = new LinkedHashMap<String, String[]>();
        for (final String item : items) {
            verdicts.put(item, evaluate(scanEval, item, isDir.get(item)));
        }

        // Self-check: a fresh evaluator driven bottom-up must agree, since the
        // product's walkers visit items in different orders.
        final LocalItemExclusionEvaluator reverseEval = newEvaluator();
        for (int i = items.size() - 1; i >= 0; i--) {
            final String item = items.get(i);
            final String[] v = evaluate(reverseEval, item, isDir.get(item));
            if (!Arrays.equals(v, verdicts.get(item))) {
                System.err.println("WARNING: evaluator result depends on visiting order for " + item);
            }
        }

        final Map<String, String> addResult = walkLikeAdd(isDir);

        System.out.println("kind\tpath\tscan\tadd\tsource\tline\trule");
        for (final String item : items) {
            final boolean dir = isDir.get(item);
            final String[] v = verdicts.get(item);
            final String scan = dir ? "-" : ("true".equals(v[0]) ? "excluded" : "included");
            System.out.println(
                (dir ? "dir" : "file")
                    + "\t" + rel(item)
                    + "\t" + scan
                    + "\t" + addResult.get(item)
                    + "\t" + v[1]
                    + "\t" + v[2]
                    + "\t" + v[3]);
        }
    }

    private static void usage() {
        System.err.println("usage: TfIgnoreOracle <workspaceRoot> [--start <dir>] [--global default|none|<file>]");
        System.exit(2);
    }

    /**
     * Builds a LocalItemExclusionEvaluator without a Workspace or server: the
     * object is allocated without running a constructor, given the fields its
     * constructors set, and then its own private initialize(String[]) runs.
     */
    private static LocalItemExclusionEvaluator newEvaluator() throws Exception {
        final Class<LocalItemExclusionEvaluator> c = LocalItemExclusionEvaluator.class;
        final Constructor<?> bare = sun.reflect.ReflectionFactory.getReflectionFactory().newConstructorForSerialization(
            c,
            Object.class.getDeclaredConstructor());
        final LocalItemExclusionEvaluator ev = c.cast(bare.newInstance());

        set(ev, "workingFolders", new WorkingFolder[] {
            new WorkingFolder("$/oracle", root)
        });
        set(ev, "startLocalItem", start);
        set(ev, "startLocalItemDepth", LocalPath.getFolderDepth(start));
        set(ev, "ignoreFiles", new ArrayList<IgnoreFile>());
        set(ev, "useOnlyStartLocalItemExclusions", false);

        final Method init = c.getDeclaredMethod("initialize", String[].class);
        init.setAccessible(true);
        init.invoke(ev, (Object) global.clone());
        return ev;
    }

    private static void set(final Object o, final String name, final Object value) throws Exception {
        final Field f = o.getClass().getDeclaredField(name);
        f.setAccessible(true);
        f.set(o, value);
    }

    /** Returns {excluded, source, line, rule}. */
    private static String[] evaluate(final LocalItemExclusionEvaluator ev, final String item, final boolean isFolder)
        throws Exception {
        final AtomicReference<String> applied = new AtomicReference<String>();
        final AtomicReference<String> ignoreFilePath = new AtomicReference<String>();
        final boolean excluded = ev.isExcluded(item, isFolder, applied, ignoreFilePath);

        final String file = ignoreFilePath.get();
        if (file == null) {
            return new String[] {
                Boolean.toString(excluded),
                "-",
                "-",
                "-"
            };
        }
        if (file.length() == 0) {
            return new String[] {
                Boolean.toString(excluded),
                "global",
                "-",
                applied.get()
            };
        }

        final String[] lineAndText = attribute(file, item, isFolder, excluded);
        return new String[] {
            Boolean.toString(excluded),
            rel(file),
            lineAndText[0],
            lineAndText[1]
        };
    }

    /**
     * Finds the line of a .tfignore that decided an item. IgnoreFile.isExcluded
     * walks its entries in file order and each matching entry overwrites the
     * result (IgnoreFile.java lines 221-316), and no entry's result depends on
     * another's, so the deciding line is the last line that yields a result on
     * its own. Each line is parsed with the product's own parser
     * (IgnoreFile.load(String, String[]) -> addExcludeEntry), and the file is
     * read the way IgnoreFile.load(String) reads it (lines 64-89).
     */
    private static String[] attribute(
        final String ignoreFilePath,
        final String item,
        final boolean isFolder,
        final boolean excluded) throws Exception {
        final String dir = new File(ignoreFilePath).getParent();
        final List<String> lines = readLikeIgnoreFile(ignoreFilePath);

        int deciding = -1;
        Boolean decidingResult = null;
        for (int n = 0; n < lines.size(); n++) {
            final IgnoreFile one = IgnoreFile.load(dir, new String[] {
                lines.get(n)
            });
            final Boolean r = one.isExcluded(item, isFolder, start, null);
            if (r != null) {
                deciding = n;
                decidingResult = r;
            }
        }

        if (deciding < 0 || decidingResult.booleanValue() != excluded) {
            return new String[] {
                "?",
                "line attribution failed"
            };
        }
        return new String[] {
            Integer.toString(deciding + 1),
            lines.get(deciding)
        };
    }

    private static List<String> readLikeIgnoreFile(final String fileName) throws Exception {
        final FileEncoding tfsEncoding = FileEncodingDetector.detectEncoding(fileName, FileEncoding.AUTOMATICALLY_DETECT);
        Charset charset = CodePageMapping.getCharset(tfsEncoding.getCodePage(), false);
        if (charset == null) {
            charset = CodePageMapping.getCharset(FileEncoding.getDefaultTextEncoding().getCodePage());
        }

        final List<String> lines = new ArrayList<String>();
        final BufferedReader reader =
            new BufferedReader(new InputStreamReader(new FileInputStream(fileName), charset.name()));
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
        } finally {
            reader.close();
        }
        return lines;
    }

    /**
     * Lists every item below dir, parents before children, skipping baseline
     * folder names as LocalItemEnumerator does (line 130). Symbolic links are
     * listed but not entered (LocalItemEnumerator line 142). Items are sorted
     * with the product's LocalPath.TOP_DOWN_COMPARATOR within each folder.
     */
    private static void enumerate(final String dir, final List<String> items, final Map<String, Boolean> isDir) {
        final File[] children = new File(dir).listFiles();
        if (children == null) {
            return;
        }
        final String[] paths = new String[children.length];
        for (int i = 0; i < children.length; i++) {
            paths[i] = children[i].getAbsolutePath();
        }
        Arrays.sort(paths, LocalPath.TOP_DOWN_COMPARATOR);

        for (final String p : paths) {
            final File f = new File(p);
            if (BaselineFolder.isPotentialBaselineFolderName(f.getName())) {
                continue;
            }
            final boolean link = Files.isSymbolicLink(f.toPath());
            final boolean directory = !link && f.isDirectory();
            items.add(p);
            isDir.put(p, directory);
            if (directory) {
                enumerate(p, items, isDir);
            }
        }
    }

    /**
     * Emulates FileSystemWalker.walk for "tf add <start> /recursive" with
     * local item exclusions applied (FileSystemWalker.java lines 148-313):
     * each listed child is skipped when isIgnored(child, isDirectory)
     * (line 227), and a subdirectory is not entered when
     * isIgnored(dir, true) (line 276). One evaluator, started at the start
     * folder, as at line 194. Hidden/system checks are omitted: on Unix the
     * product's native attributes never report hidden (filesystem_jni.c
     * line 215).
     */
    private static Map<String, String> walkLikeAdd(final Map<String, Boolean> isDir) throws Exception {
        final LocalItemExclusionEvaluator ev = newEvaluator();
        final Map<String, String> result = new LinkedHashMap<String, String>();
        final Deque<String> stack = new ArrayDeque<String>();
        stack.push(start);

        while (!stack.isEmpty()) {
            final String dirName = stack.pop();
            final File[] children = new File(dirName).listFiles();
            if (children == null) {
                continue;
            }
            final String[] paths = new String[children.length];
            for (int i = 0; i < children.length; i++) {
                paths[i] = children[i].getAbsolutePath();
            }
            Arrays.sort(paths, LocalPath.TOP_DOWN_COMPARATOR);

            for (final String p : paths) {
                final boolean link = Files.isSymbolicLink(new File(p).toPath());
                final boolean directory = Files.isDirectory(new File(p).toPath(), LinkOption.NOFOLLOW_LINKS) && !link;
                result.put(p, isIgnored(ev, p, directory) ? "excluded" : "added");
            }

            final List<String> dirs = new ArrayList<String>();
            for (final String p : paths) {
                if (new File(p).isDirectory()) {
                    dirs.add(p);
                }
            }
            for (int i = dirs.size() - 1; i >= 0; i--) {
                final String d = dirs.get(i);
                if (Files.isSymbolicLink(new File(d).toPath())) {
                    continue;
                }
                if (isIgnored(ev, d, true)) {
                    continue;
                }
                stack.push(d);
            }
        }

        // Items never listed lie under a pruned folder: name the nearest
        // listed ancestor, which is the folder the walk refused to enter.
        final Map<String, String> listed = new LinkedHashMap<String, String>(result);
        for (final String item : isDir.keySet()) {
            if (!listed.containsKey(item)) {
                String ancestor = new File(item).getParent();
                while (ancestor != null && !listed.containsKey(ancestor)) {
                    ancestor = new File(ancestor).getParent();
                }
                result.put(item, "unreached:" + (ancestor == null ? "?" : rel(ancestor)));
            }
        }
        return result;
    }

    private static boolean isIgnored(final LocalItemExclusionEvaluator ev, final String p, final boolean isFolder) {
        if (BaselineFolder.isPotentialBaselineFolderName(LocalPath.getFileName(p))) {
            return true;
        }
        return ev.isExcluded(p, isFolder, new AtomicReference<String>(), null);
    }

    private static String rel(final String p) {
        if (p.equals(start)) {
            return ".";
        }
        if (p.startsWith(start + File.separator)) {
            return p.substring(start.length() + 1).replace(File.separatorChar, '/');
        }
        return p;
    }
}
