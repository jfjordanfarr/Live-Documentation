#!/usr/bin/env bash
# Builds the .tfignore oracle from Team Explorer Everywhere's unchanged sources.
# Usage: bash build.sh   (run from anywhere; paths are relative to this file)
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
tee="$here/../team-explorer-everywhere/source"
out="$here/classes"

rm -rf "$out"
mkdir -p "$out"

cp_jars="$tee/com.microsoft.tfs.logging/lib/commons-logging-1.2/commons-logging-1.2.jar"
for j in "$tee"/com.microsoft.tfs.core/libs/*.jar "$tee"/com.microsoft.tfs.core/libs/*/*.jar \
         "$tee"/com.microsoft.tfs.core.httpclient/libs/*/*.jar \
         "$tee"/com.microsoft.tfs.logging/lib/*/*.jar; do
  cp_jars="$cp_jars:$j"
done

# stubs/ holds compile-time stand-ins for four Eclipse runtime types that one
# unreachable method (DefaultHTTPClientFactory.getProductInformation) names.
srcpath="$here/stubs:$tee/com.microsoft.tfs.core/src:$tee/com.microsoft.tfs.core/rest_core"
srcpath="$srcpath:$tee/com.microsoft.tfs.util/src:$tee/com.microsoft.tfs.jni/src"
srcpath="$srcpath:$tee/com.microsoft.tfs.core.ws/src:$tee/com.microsoft.tfs.core.ws/generated-src"
srcpath="$srcpath:$tee/com.microsoft.tfs.core.ws.runtime/src:$tee/com.microsoft.tfs.core.httpclient/src"
srcpath="$srcpath:$tee/com.microsoft.tfs.logging/src"

core="$tee/com.microsoft.tfs.core/src/com/microsoft/tfs/core"

# 1. Microsoft's classes, unchanged, plus whatever they reference (-implicit:class).
javac -nowarn -proc:none -encoding UTF-8 --release 8 -implicit:class \
  -cp "$cp_jars" -sourcepath "$srcpath" -d "$out" \
  "$core/clients/versioncontrol/localworkspace/LocalItemExclusionEvaluator.java" \
  "$core/clients/versioncontrol/localworkspace/IgnoreFile.java" \
  "$core/clients/versioncontrol/localworkspace/IgnoreEntry.java" \
  "$core/clients/versioncontrol/localworkspace/BaselineFolder.java" \
  "$core/clients/versioncontrol/internal/localworkspace/ExclusionSet.java" \
  "$core/clients/versioncontrol/soapextensions/WorkingFolder.java" \
  "$core/clients/versioncontrol/path/LocalPath.java" \
  "$core/clients/versioncontrol/path/ItemPath.java" \
  "$core/util/FileEncodingDetector.java" \
  "$core/util/CodePageMapping.java" \
  "$tee/com.microsoft.tfs.jni/src/com/microsoft/tfs/jni/internal/ntlm/MD4.java"

# Resources the classes load at run time (message bundles, codepages.xml, ...).
for d in com.microsoft.tfs.core/src com.microsoft.tfs.util/src com.microsoft.tfs.jni/src; do
  ( cd "$tee/$d" && find . -type f ! -name '*.java' -exec cp --parents {} "$out" \; )
done

# 2. The driver.
javac -nowarn -encoding UTF-8 -cp "$out:$cp_jars" -d "$out" "$here/src/tfignoreoracle/TfIgnoreOracle.java"

echo "$out:$cp_jars" > "$here/classpath.txt"
echo "built; classpath in $here/classpath.txt"
