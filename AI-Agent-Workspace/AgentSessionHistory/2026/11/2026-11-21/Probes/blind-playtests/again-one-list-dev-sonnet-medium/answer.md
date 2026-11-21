I applied GitHub's Visual Studio ignore list, and the page now says 10,881 files will be read. That is down from 17,244, with 6,363 files left out.

The list removed the downloaded packages (the `packages/` folder, 4,591 files) and the build output (`obj/`, `bin/`, `Debug/`). It also removed some logs and stray `.pdb` and `.mdf` files. It did not touch the top-level source folders, such as DNN Platform and Dnn.AdminExperience.

The list also left out 927 files that count as code a reader would read:
- **Packages:** 468 are in `packages/`, which is what I wanted gone.
- **Build output:** 244 are in `obj/`, 164 in `bin/` and 29 in `Debug/`.
- **Log folders:** 22 are `.cs` files in `Log/` folders. Those might be real source, and I didn't check.

The page also offered to pull in the project's own 25 `.gitignore` and 15 `.tfignore` files. I left that alone, so those files aren't applied. It also flagged 3 lines in the list as unable to keep what they name, because a folder above them is already left out whole. I didn't look into those.

I didn't press Scan. The count comes from the page's preview.
