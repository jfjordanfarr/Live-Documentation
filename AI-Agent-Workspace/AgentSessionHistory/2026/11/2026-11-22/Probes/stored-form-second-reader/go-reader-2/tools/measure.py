# Runs a command and prints its wall time and peak memory (max RSS).
import resource, subprocess, sys, time
t = time.time()
with open(sys.argv[1], 'wb') as out:
    p = subprocess.run(sys.argv[2:], stdout=out)
r = resource.getrusage(resource.RUSAGE_CHILDREN)
print(f'{sys.argv[2:][1]}: exit {p.returncode}, {time.time()-t:.2f}s, {r.ru_maxrss/1024:.0f} MB peak')
