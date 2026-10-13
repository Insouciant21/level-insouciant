import { ArticleEngagementPanel } from './article-engagement-panel'
import { IslandProvider } from '@/components/providers/island-provider'
export default function ArticleEngagementIsland({slug, location}: {slug: string; location: string}) {
 return <IslandProvider location={location}><ArticleEngagementPanel slug={slug} /></IslandProvider>
}
