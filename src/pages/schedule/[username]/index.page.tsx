import { Avatar, Heading, Text } from '@ignite-ui/react'
import { Container, UserHeader } from './styles'
import { GetStaticPaths, GetStaticProps } from 'next'
import { prisma } from '@/lib/prisma'

interface ScheduleProps {
  user: {
    name: string
    bio: string
    avatar: string
  }
}

export default function Schedule({ user }: ScheduleProps) {
  const { name, bio, avatar } = user

  return (
    <Container>
      <UserHeader>
        <Avatar src={avatar} />
        <Heading>{name}</Heading>
        <Text>{bio}</Text>
      </UserHeader>
    </Container>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

// TODO o problema está sendo que o parametro está com o nome de usuário, não o username que é único
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const username = String(params?.username)

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      user: {
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
      },
    },
    revalidate: 60 * 60 * 24, // 1 day
  }
}
