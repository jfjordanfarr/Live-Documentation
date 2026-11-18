# Existing actual reporter files

These are byte-for-byte copies of the actual Playwright reporter/output files still available at close-out. The final reporter run was the three normal-default reading-refresh cases; its HTML report and last-run metadata are preserved here. Root stores the HTML losslessly compressed as a source capture: otherwise the asset audit interprets JavaScript template strings inside the reporter bundle as page resource paths. Decompression reproduces the original 539,112 bytes and recorded SHA-256 exactly. [Provenance](provenance.json) records original paths, source modification times, sizes and hashes.

- [Final Playwright HTML report](playwright-final-refresh-three.html.gz)
- [Final last-run metadata](playwright-final-last-run.json)

No standalone stdout files were captured for the earlier 38-case run, the earlier three-case symbol/fragment rerun, the 41-case attempt, builds, generation or lint. Those commands were executed without tee/file redirection, and earlier Playwright HTML reports were overwritten by subsequent runs. Their stdout logs are therefore missing. Nothing here reconstructs missing output from chat, tool history or agent traces.

The failed attempts remain separately identified in the existing reading evidence: the initial short-document alignment check, fractional heading clipping, and the later keyboard-focus baseline failure. Their pictures and structured failure observations are not final passing-run logs. The root’s combined gate on main supplies the primary complete verification log.
