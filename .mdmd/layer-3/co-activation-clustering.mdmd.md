# Co-Activation Clustering

## Metadata
- Layer: 3
- Archetype: component
- Live Doc ID: COMP-co-activation-clustering

## Authored
### Purpose
Document the statistical co-activation analysis that identifies clusters of files likely to change together, using a degree-corrected configuration model to avoid false positives from hub nodes like barrel/index files.

### Notes
- Co-activation analysis reads the Live Documentation graph and computes which files are statistically "surprising" to see linked together—beyond what their individual connectivity would predict.
- The implementation lives in `packages/shared/src/live-docs/analysis/coActivation.ts` and is invoked via `npm run live-docs:co-activation`.
- Results feed into System-layer documentation generation (`npm run live-docs:system`), helping identify emergent architectural clusters.

### Statistical Methodology

#### Degree-Corrected Configuration Model (Implemented 2026-01-17)

The core insight: hub files (barrel exports, index.ts) have high connectivity by nature. A naive uniform background would make hub-to-hub edges appear artificially significant.

**Solution**: Use the configuration model from network science where:

$$E[edge(i,j)] = \frac{d_i \cdot d_j}{2E}$$

Where:
- $d_i$ = degree of node $i$ (number of edges)
- $d_j$ = degree of node $j$
- $E$ = total edge count in the graph

This means high-degree nodes are **expected** to have more edges, so only edges that exceed this expectation are flagged as significant.

#### Symbol-Level Edge Counting

Following the bioinformatics principle that "2 symbol imports = 2 edges" (analogous to MEME motif counting), we count each symbol reference as a separate edge:

```typescript
// If file A imports 3 symbols from file B, that's weight 3
const weight = dependencyLinks.length; // Not just 1
```

This prevents a file importing many symbols from appearing less connected than one importing few.

#### Significance Testing

For each edge, we compute a p-value using a Poisson tail test:

$$P(X \geq observed) = 1 - \sum_{k=0}^{observed-1} \frac{\lambda^k e^{-\lambda}}{k!}$$

Where $\lambda$ is the expected edge count under the degree-corrected model.

Multiple hypothesis correction uses Benjamini-Hochberg to control the false discovery rate.

### Key Metrics

From our workspace (2026-01-17, post-de-barreling):
- **622 nodes** (Live Docs)
- **2,348 total edge weight** (symbol-level counting)
- **14 significant clusters** (down from 16 after degree correction)
- Positive control (benchmark fixtures cluster): **3.42x enrichment**, p < 10⁻¹³

### Strategy
- Refine cluster detection to identify sub-clusters (e.g., Rosetta fixtures within the broader benchmark cluster).
- Explore temporal co-activation using git commit history to identify files that change together over time.
- Surface co-activation insights in the Explorer Force Graph view for visual cluster discovery.

## System References
### Components
- [packages/shared/src/live-docs/analysis/coActivation.ts](../layer-4/packages/shared/src/live-docs/analysis/coActivation.ts.mdmd.md)

### CLI Entry Points
- [scripts/live-docs/co-activation.ts](../layer-4/scripts/live-docs/co-activation.ts.mdmd.md)

## Evidence
- `npm run live-docs:co-activation -- --config .live-docs.config.json` regenerates `data/live-docs/co-activation.json`.
- Dev Day 61 (2026-01-17) implemented degree-corrected model, validated against positive control (fixtures cluster detected at 3.42x enrichment).
- System docs post-de-barreling show 2 garbage clusters (test fixture integration clusters) correctly filtered out vs. the pre-correction run.
