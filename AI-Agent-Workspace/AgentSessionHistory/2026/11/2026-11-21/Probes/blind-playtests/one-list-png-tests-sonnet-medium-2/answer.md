With both exclusions in place, **15,020 files will be read**. The other 2,224 are left out: 1,325 PNG images and 899 files under `DNN Platform/Tests`.

These are the lines in the list that did it:

```
### Yours
*.png
/DNN Platform/Tests/
```

The first line is only a comment. `*.png` excludes every PNG image. `/DNN Platform/Tests/` excludes that folder from the top level only. I didn't click Scan, so nothing has been scanned yet.
