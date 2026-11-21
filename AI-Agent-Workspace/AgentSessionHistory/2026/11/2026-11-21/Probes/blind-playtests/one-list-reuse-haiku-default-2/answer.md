The list is set up to skip build output and downloaded packages, and it's on your clipboard. I haven't run a scan yet.

It contains these lines:

```
# build output
bin/
obj/
# downloaded packages
packages/
node_modules/
```

With this list, 6,305 files are left out and 10,939 will be read. I used generic patterns so the list works on other folders. The page's built-in "What these folders hold" preset has over 40 entries tied to specific paths in this folder, so I didn't use it.

To reuse it, paste the clipboard contents into the "Your list" box on the next folder you scan. The page's download button didn't work here because this window doesn't keep downloads, so the clipboard is the only saved copy. If you want it kept permanently, save those lines into a text file on your machine.
