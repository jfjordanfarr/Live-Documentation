**15,020 files will be read.** Before the exclusions, the page showed 17,244, so 2,224 files are left out.

The lines that did it are the two I typed into "Your list", as a .gitignore-style list:

```
*.png
DNN Platform/Tests/
```

The page's "Left out" panel attributes the 2,224 files to "Your list": 1,325 `.png` files, plus 899 other files from the `DNN Platform/Tests` folder (`.cs`, `.config`, `.csproj`, `.json`, `.sql`, and so on). I didn't scan or change anything else. The list is still in the page's editor.
