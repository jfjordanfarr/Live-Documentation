Once I leave out every PNG image and the `DNN Platform/Tests` folder, **15,020 files will be read**. That's down from 17,244, so 2,224 files are left out. Of those, 1,325 are PNGs and the rest are in the Tests folder.

I added these two lines to the page's list, written like a `.gitignore`:

```
*.png
/DNN Platform/Tests/
```

The page also found 25 `.gitignore` and 15 `.tfignore` files and offered to add them to the list. I left that alone, so the count only reflects the two lines above. I didn't press Scan.
