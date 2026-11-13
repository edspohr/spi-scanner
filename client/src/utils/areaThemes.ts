import type { PracticeArea } from './opportunityAreas';

export const AREA_THEMES: Record<PracticeArea, {
  name:string; text:string; muted:string; soft:string; icon:string;
  button:string; card:string; header:string; count:string;
}> = {
  regulatory:{
    name:'Regulatorio',text:'text-sky-900',muted:'text-sky-700',soft:'bg-sky-50/80',
    icon:'bg-sky-700 text-white shadow-sky-900/10',
    button:'bg-sky-700 hover:bg-sky-800 focus-visible:ring-sky-500',
    card:'hover:shadow-sky-950/5 hover:ring-sky-200/80',
    header:'from-sky-100/80 to-sky-50/20',count:'bg-sky-100 text-sky-800'
  },
  intellectual_property:{
    name:'Propiedad Intelectual',text:'text-violet-900',muted:'text-violet-700',soft:'bg-violet-50/80',
    icon:'bg-violet-700 text-white shadow-violet-900/10',
    button:'bg-violet-700 hover:bg-violet-800 focus-visible:ring-violet-500',
    card:'hover:shadow-violet-950/5 hover:ring-violet-200/80',
    header:'from-violet-100/80 to-violet-50/20',count:'bg-violet-100 text-violet-800'
  }
};
