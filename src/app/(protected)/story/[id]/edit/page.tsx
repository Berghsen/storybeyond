import StoryForm from '@/components/story/StoryForm'

export default function EditStoryPage({ params }: { params: { id: string } }) {
  return <StoryForm mode="edit" storyId={params.id} />
}

