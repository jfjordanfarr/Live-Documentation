A scan would read **10,945 files** and leave out **6,299**. Nothing was scanned or changed. I only expanded some folder rows to look inside, which is view-only.

**What's left out and why:**

1. **`packages` folder: 661 files.** This is the one large item I can name with a file count. It's unchecked, and the page labels it "NuGet packages." Third-party dependencies aren't your source code, so they're excluded.
2. **Build and package folders: the rest, about 5,638 files.** This is the bulk of the 6,299. The page doesn't give per-folder file counts for these, so I can't name the biggest one. Each row shows only a folder count, such as 177 in DNN Platform, 18 in Dnn.AdminExperience, 12 in Connectors, and 6 in DotNetNuke.BulkInstall. They're left out because the "Leave out build output and packages" box is checked. Build output is generated from source, so reading it adds noise and duplicates.

The 8 files left out under Dnn.AdminExperience aren't explained on the page. They're probably the same build/package rule, but I haven't confirmed that.

To see what's excluded, uncheck "Leave out build output and packages." The count of files read will go up, and the 661 `packages` files will stay out until you tick that box.
