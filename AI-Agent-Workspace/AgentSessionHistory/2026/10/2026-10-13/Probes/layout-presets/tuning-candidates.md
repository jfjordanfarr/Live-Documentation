# Compact / Relaxed tuning candidates

Historical headless comparison, October 13, 2026. These 24 runs used the corrected projection over the 632-file repository bundle and the 35-file estate before the new implementation mirrors were regenerated. The configurations and results accompany this table as JSON; the page captures are disposable inputs. The scope names refer to the shared layout deck.

The selected candidates were subsequently rendered and inspected across six scopes; a numerical result alone is not the visual verdict. The dense repository’s regularity candidate spends 61 pixels of height for fewer boundary turns and better row alignment; the estate candidate also shortens the picture. Costs use different weights across candidates and are not a shared leaderboard.

| Scope | Base profile | Variant | Width × height | Steps | Step distance | Row misalignment | Vertical wire cost |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| estate/five | relaxed | current | 3160 × 1538 | 7 | 865 | 547 | 14107 |
| estate/five | relaxed | steps200 | 3160 × 1266 | 4 | 758 | 612 | 16286 |
| estate/five | relaxed | steps400 | 3160 × 1266 | 4 | 758 | 612 | 16286 |
| estate/five | relaxed | even2 | 3160 × 1448 | 3 | 442 | 414 | 15796 |
| estate/five | relaxed | rows025 | 3160 × 1538 | 7 | 865 | 547 | 14107 |
| estate/five | relaxed | rows05 | 3160 × 1538 | 7 | 865 | 547 | 14107 |
| estate/five | relaxed | regular | 3160 × 1448 | 3 | 442 | 414 | 15796 |
| estate/five | relaxed | space | 3160 × 1702 | 3 | 462 | 519 | 14630 |
| estate/five | compact | current | 2936 × 1197 | 5 | 868 | 580 | 15235 |
| estate/five | compact | steps50 | 2936 × 1197 | 5 | 868 | 580 | 15235 |
| estate/five | compact | steps100 | 2936 × 1197 | 5 | 868 | 580 | 15235 |
| estate/five | compact | even1 | 2936 × 1203 | 5 | 741 | 580 | 15284 |
| repository/five | relaxed | current | 3926 × 3382 | 33 | 8025 | 5493 | 192910 |
| repository/five | relaxed | steps200 | 3926 × 3382 | 33 | 8025 | 5493 | 192910 |
| repository/five | relaxed | steps400 | 3926 × 3382 | 29 | 7024 | 5180 | 194918 |
| repository/five | relaxed | even2 | 3926 × 3382 | 33 | 7318 | 5241 | 193901 |
| repository/five | relaxed | rows025 | 3926 × 3382 | 33 | 8025 | 5465 | 192910 |
| repository/five | relaxed | rows05 | 3926 × 3382 | 33 | 7647 | 5309 | 193366 |
| repository/five | relaxed | regular | 3926 × 3443 | 26 | 6081 | 4812 | 196991 |
| repository/five | relaxed | space | 3926 × 3382 | 33 | 8025 | 5493 | 192910 |
| repository/five | compact | current | 3758 × 3238 | 40 | 9457 | 5725 | 181091 |
| repository/five | compact | steps50 | 3758 × 3238 | 38 | 9476 | 5649 | 181178 |
| repository/five | compact | steps100 | 3758 × 3238 | 33 | 7892 | 5243 | 182406 |
| repository/five | compact | even1 | 3758 × 3238 | 33 | 7833 | 5229 | 182446 |

Selected candidates: Compact `even1`; Relaxed `regular`. The full configurations in the JSON distinguish these from later changes to the named defaults. Source: [the implementation request and record](../../../ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).
