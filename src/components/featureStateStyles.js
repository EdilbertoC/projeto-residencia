export const featureStateStyles = {
  live: {
    badge: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    panel: 'border-emerald-500/35 bg-emerald-500/8',
    title: 'text-emerald-300',
    label: 'Integrado',
  },
  partial: {
    badge: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
    panel: 'border-sky-500/35 bg-sky-500/8',
    title: 'text-sky-300',
    label: 'Parcial',
  },
  mock: {
    badge: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    panel: 'border-amber-500/35 bg-amber-500/8',
    title: 'text-amber-300',
    label: 'Mockado',
  },
  wip: {
    badge: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
    panel: 'border-rose-500/35 bg-rose-500/8',
    title: 'text-rose-300',
    label: 'WIP',
  },
}

export function featurePanelClass(status = 'partial') {
  const current = featureStateStyles[status] || featureStateStyles.partial
  return current.panel
}
