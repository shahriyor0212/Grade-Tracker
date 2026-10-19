import { LayoutDashboard, Target, Archive } from 'lucide-react';

/** Global route registry: 3 tabs in shell order. */
export const VIEWS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'targets', label: 'Targets', icon: Target },
  { id: 'archive', label: 'Archive', icon: Archive },
];

export const VIEW_IDS = VIEWS.map((view) => view.id);

export const DEFAULT_VIEW = 'dashboard';

export function isValidView(viewId) {
  return VIEW_IDS.includes(viewId);
}
