# Probe of 2026-11-22 (not product code): runs a command, passes its output through, and writes as the last line of
# standard error the peak resident memory of the command's processes in KiB, as GNU time's %M would (it is not
# installed here). Its exit code is the command's, or 128 and the signal that ended it.
import resource
import subprocess
import sys

completed = subprocess.run(sys.argv[1:])
peak = resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss
sys.stderr.write(f"\n{peak}\n")
sys.exit(completed.returncode if completed.returncode >= 0 else 128 - completed.returncode)
