With those two lines, 15,020 files will be read and 2,224 are left out. Before I added them, the count was 17,244 files read. I didn't click Scan.

These are the two lines I wrote in the list:

```
*.png
DNN Platform/Tests/
```

The first line leaves out every PNG image, which accounts for 1,325 of the files left out. The second line leaves out the `DNN Platform/Tests` folder.
