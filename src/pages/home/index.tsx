import { Heading, Text } from '@ignite-ui/react'
import { Container, Hero, Preview } from './styles'

import PreviewImage from '@/assets/app-preview.png'
import Image from 'next/image'
import { ClaimUsernameForm } from './ClaimUsernameForms'
import { NextSeo } from 'next-seo'

export default function Home() {
  return (
    <>
      <NextSeo
        title="Descomplique a sua agenda | ignite call"
        description="Conecte seu calendário e permita que as pessoas marquem agendamentos
        no seu tempo livre."
      />
      <Container>
        <Hero>
          <Heading size="4xl">Agendamento Descomplicado</Heading>
          <Text size="xl">
            Conecte seu calendário e permita que as pessoas marquem agendamentos
            no seu tempo livre.
          </Text>
          <ClaimUsernameForm />
        </Hero>

        <Preview>
          <Image
            src={PreviewImage}
            height={400}
            quality={100}
            priority
            alt="calendário simbolizando a aplicação em funcionamento"
          />
        </Preview>
      </Container>
    </>
  )
}
