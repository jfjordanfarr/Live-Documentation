After applying one preset, **10,953 files** will be read, down from 17,244 at the start. I did not click Scan.

What I did:
1. Started from the page's default, which listed 17,244 files to read.
2. Clicked the preset "What these folders hold." It adds exclusions for `bin/` and `obj/` beside project files, and for `packages/` folders (NuGet downloads). It left out 6,291 files, including `.dll` (2,586), `.pdb` (864), and `.xml` (782). `.dll` and `.pdb` no longer appear in the "Will be read" kinds list.

I did not apply the second preset, "GitHub's Visual Studio list" (234 lines, 6,363 files left out). It would likely remove more build output, but it also wasn't needed for your criteria and I didn't check its full contents. My second click landed in the editor rather than on that preset, so nothing was added and nothing was typed.

Two things I left alone because they aren't build output or packages: the `Build` folder (96 files, which may be build tooling rather than output) and image and asset files such as `.png` (1,325), `.gif` (671), and `.svg` (283). If you want those gone too, they can be excluded in the "Your list" editor.
