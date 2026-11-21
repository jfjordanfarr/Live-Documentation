With those two lines in the list, 15,020 files will be read. That's down from 17,244, so 2,224 files are left out. Of those, 1,325 are PNG images, and the rest are the files under `DNN Platform/Tests`.

The lines that did it:

```
*.png
/DNN Platform/Tests/
```

I typed them into the "Your list" box on the page. I didn't click Scan, and I left the page's offer to take in the 25 `.gitignore` and 15 `.tfignore` files unanswered. Nothing was copied to the clipboard.
