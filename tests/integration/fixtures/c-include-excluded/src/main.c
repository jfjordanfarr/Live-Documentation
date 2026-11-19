#include "../gen/table.def"
#include "../gen/colours.inc"

/* Looks every colour up in the table. */
int main(void) {
  int total = 0;
  for (int i = 0; i < colour_count && i < table_size; i++) total += table_lookup(i);
  return total;
}
