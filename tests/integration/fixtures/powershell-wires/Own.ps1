# Defines its own Resolve-Target, as Copies/Alpha.psm1 and Copies/Beta.psm1 do: its call reaches its own.
function Resolve-Target {
    param([string]$Name)
    "own:$Name"
}

Resolve-Target -Name 'west'
