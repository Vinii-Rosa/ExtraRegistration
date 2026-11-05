import { ProjectsView } from "@/components/projects/projects-view";
import { ProjectsPageProvider } from "@/contexts/projects-page-context";

export default function ProjetosPage() {
  return (
    <ProjectsPageProvider>
      <ProjectsView />
    </ProjectsPageProvider>
  );
}
