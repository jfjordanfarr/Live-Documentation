// A second decoy with the same tail as the real header, core/engine.hpp, in a
// directory that sorts before include/. The compiler never sees it: no -I
// names extra/, and nothing includes it. A rule that matches by tail alone and
// breaks ties alphabetically picks this file for "core/engine.hpp".
#pragma once

int extra_engine_run();
