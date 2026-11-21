# Moves the X server's own pointer, so that the browser sees a real pointer at rest: python3 warp.py <x> <y>
import ctypes, sys
x11 = ctypes.CDLL("libX11.so.6")
x11.XOpenDisplay.restype = ctypes.c_void_p
x11.XDefaultRootWindow.argtypes = [ctypes.c_void_p]; x11.XDefaultRootWindow.restype = ctypes.c_ulong
x11.XWarpPointer.argtypes = [ctypes.c_void_p, ctypes.c_ulong, ctypes.c_ulong, ctypes.c_int, ctypes.c_int, ctypes.c_uint, ctypes.c_uint, ctypes.c_int, ctypes.c_int]
x11.XFlush.argtypes = [ctypes.c_void_p]; x11.XCloseDisplay.argtypes = [ctypes.c_void_p]
d = x11.XOpenDisplay(None)
root = x11.XDefaultRootWindow(d)
x, y = int(sys.argv[1]), int(sys.argv[2])
for dx in (-30, -15, -5, 0):
    x11.XWarpPointer(d, 0, root, 0, 0, 0, 0, x + dx, y)
    x11.XFlush(d)
x11.XCloseDisplay(d)
