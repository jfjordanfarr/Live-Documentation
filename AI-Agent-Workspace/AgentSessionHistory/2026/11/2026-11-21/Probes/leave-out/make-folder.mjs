#!/usr/bin/env node
// Makes a folder of the owner's shape from DNN, to try what a scan leaves out before it reads (the root's brief of
// 2026-11-21): DNN's solution folders as they are, without `.git`, its `.gitignore` files and the tool's own docs, as a
// TFS folder would hold them; built output under `bin` and `obj` beside every project file; committed NuGet `packages`
// folders, one at the top holding 600 packages and one in each of the first 45 project folders holding 80, each holding a `repositories.config` and
// NuGet-shaped `<Id>.<Version>` folders; and NuGet's own recommended `.tfignore` in every third of those 45 project
// folders, none in the rest. Every file made is empty: only names matter before a scan. Writes a manifest of what it
// made, by kind, so that a listing can count what it wrongly keeps.
//
//   node make-folder.mjs <DNN folder, read only> <folder to make>
import fs from "node:fs";
import path from "node:path";

const [source, target] = process.argv.slice(2);
fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true, filter: (from) => ![".git", ".live-documentation", ".gitignore"].includes(path.basename(from)) });

const made = { build: [], packages: [] };
const put = (kind, file) => {
  fs.mkdirSync(path.dirname(path.join(target, file)), { recursive: true });
  fs.writeFileSync(path.join(target, file), "");
  made[kind].push(file);
};

const projects = [];
const walk = (relative) => {
  for (const entry of fs.readdirSync(path.join(target, relative), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(child);
    else if (entry.name.endsWith(".csproj")) projects.push({ folder: relative, name: path.basename(entry.name, ".csproj") });
  }
};
walk("");

// Built output beside every project file.
for (const { folder, name } of projects) {
  const at = (file) => (folder ? `${folder}/${file}` : file);
  for (const config of ["Debug", "Release"]) {
    for (const extension of ["dll", "pdb", "xml", "dll.config"]) put("build", at(`bin/${config}/${name}.${extension}`));
    for (const dependency of ["Newtonsoft.Json", "log4net", "Microsoft.Extensions.DependencyInjection"]) put("build", at(`bin/${config}/${dependency}.dll`));
  }
  for (const file of ["project.assets.json", `${name}.csproj.nuget.g.props`, `Debug/${name}.AssemblyInfo.cs`, `Debug/${name}.csproj.FileListAbsolute.txt`, `Debug/${name}.dll`, `Debug/${name}.pdb`, `Debug/TemporaryGeneratedFile_1.cs`]) put("build", at(`obj/${file}`));
}

// NuGet packages committed beside the solution and in the first 45 projects.
const ids = ["Newtonsoft.Json", "EntityFramework", "log4net", "Microsoft.AspNet.Mvc", "Microsoft.AspNet.WebApi.Core", "Microsoft.AspNet.Razor", "Microsoft.Web.Infrastructure", "Moq", "NUnit", "Castle.Core", "AutoMapper", "Dapper", "Microsoft.Extensions.DependencyInjection", "Microsoft.Extensions.Logging", "System.Memory", "System.Buffers", "System.Text.Json", "Serilog", "Polly", "FluentValidation"];
const versionsOf = (i) => [`${1 + (i % 9)}.${i % 4}.${(i * 7) % 10}`, `${2 + (i % 5)}.0.${i % 3}`, `${4 + (i % 3)}.${(i * 3) % 8}.1`, `${i % 2 + 10}.0.0`];
const packagesFolder = (folder, count) => {
  const at = folder ? `${folder}/packages` : "packages";
  put("packages", `${at}/repositories.config`);
  for (let i = 0; i < count; i++) {
    const id = `${ids[i % ids.length]}${i >= ids.length ? `.Extensions${Math.floor(i / ids.length)}` : ""}`;
    const version = versionsOf(i)[i % 4];
    const pkg = `${at}/${id}.${version}`;
    put("packages", `${pkg}/${id}.${version}.nupkg`);
    for (const framework of ["net45", "net461", "netstandard2.0"]) {
      put("packages", `${pkg}/lib/${framework}/${id}.dll`);
      put("packages", `${pkg}/lib/${framework}/${id}.xml`);
      put("packages", `${pkg}/lib/${framework}/${id}.pdb`);
    }
    for (const file of ["content/Scripts/readme.txt", "content/Web.config.transform", "tools/install.ps1", "tools/init.ps1", "build/" + id + ".targets", "build/" + id + ".props"]) put("packages", `${pkg}/${file}`);
    for (let j = 0; j < 6; j++) put("packages", `${pkg}/lib/net45/${["de", "fr", "es", "ja", "ko", "zh-Hans"][j]}/${id}.resources.dll`);
  }
};
packagesFolder("", 600);
const tfignore = "# Ignore NuGet Packages\n*.nupkg\n\n# Ignore the NuGet packages folder in the root of the repository. If needed, prefix 'packages'\n# with additional folder names if it's not in the same folder as .tfignore.\npackages\n\n# Omit temporary files\nproject.lock.json\nproject.assets.json\n*.nuget.props\n";
const withTfignore = [];
projects.slice(0, 45).forEach(({ folder }, index) => {
  packagesFolder(folder, 80);
  if (index % 3 === 0) {
    fs.writeFileSync(path.join(target, folder, ".tfignore"), tfignore);
    withTfignore.push(folder);
  }
});

fs.writeFileSync(`${target}.manifest.json`, JSON.stringify({ projects: projects.length, withTfignore, build: made.build, packages: made.packages }));
console.log(`made ${made.build.length} built files and ${made.packages.length} package files beside ${projects.length} projects; .tfignore in ${withTfignore.length} project folders`);
