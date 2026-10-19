const internalValue = 41;

function internalHelper(): number {
  return internalValue + 1;
}

// Nothing is exported: the API reference has no public surface to document.
void internalHelper;
