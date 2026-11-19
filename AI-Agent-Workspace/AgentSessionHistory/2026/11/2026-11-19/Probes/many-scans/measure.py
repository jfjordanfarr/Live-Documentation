# Run a command; print wall seconds, processor seconds of all children, peak RSS of the largest child, and load.
import os, resource, subprocess, sys, time
t0 = time.time()
r = subprocess.run(sys.argv[1:])
wall = time.time() - t0
u = resource.getrusage(resource.RUSAGE_CHILDREN)
print(f"[measure] exit={r.returncode} wall={wall:.1f}s cpu={u.ru_utime+u.ru_stime:.1f}s peak_rss={u.ru_maxrss/1024:.0f}MB load={os.getloadavg()[0]:.1f}", file=sys.stderr)
sys.exit(r.returncode)
