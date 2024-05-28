import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'
import { Container, Header } from '../styles'
import {
  FormError,
  IntervalBox,
  IntervalContainer,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
} from './styles'
import { inputConfig } from '@/utils/TextInputIntialConfig'
import { ArrowRight } from 'phosphor-react'
import { z } from 'zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { getWeekDays } from '@/utils/get-week-days'
import { zodResolver } from '@hookform/resolvers/zod'
import { convertTimeStringToMinutes } from '@/utils/convert-times-string-to-minutes'
import { api } from '@/lib/axios'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'

const TimeIntervalsFormSchema = z.object({
  // Declarações de valores a serem validados e transformados
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)

    /*  Transformações de valores pelo Zod
     *  transform() transforma valor final manipulando os dados
     *  refine() ele retorna em true ou false para validação de errors de forma mais completa
     *  tanto o refine como o transform se comportam de forma parecida, recebem função com parametro dos valores declarados acima
     */

    // filtra os valores que tem enabled como true
    .transform((intervals) => intervals.filter((interval) => interval.enabled))

    // validação para que exista pelo menos um campo enabled true
    .refine((intervals) => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos um dia da semana!',
    })

    // faz transformação de dados para retornarem valores de tempo inicial e fim do agendamento em minutos
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      })
    })

    // validação dos campos de minutos de término do agendamento ter pelo menos 1h de distância do começo do agendamento
    .refine(
      (intervals) => {
        return intervals.every((interval) => {
          return interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes
        })
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do início',
      },
    ),
})

// type TimeIntervalsFormData = z.infer<typeof TimeIntervalsFormSchema> --- método convencional de inferir tipos pelo zod
// type TimeIntervalsFormInput = z.input<typeof TimeIntervalsFormSchema> --- input é como os dados são declarados no schema
type TimeIntervalsFormOutput = z.output<typeof TimeIntervalsFormSchema> // --- output é como os dados são transformados e refinados no schema

export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(TimeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const weekDays = getWeekDays()

  const intervals = watch('intervals')

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TimeIntervalsFormOutput

    await api.post('/users/time-intervals', {
      intervals,
    })

    await router.push('/register/update-profile')
  }

  return (
    <>
      <NextSeo title="Selecione a sua disponibilidade | ignite call" noindex />

      <Container>
        <Header>
          <Heading as="strong">Conecte sua agenda!</Heading>
          <Text>
            Conecte o seu calendário para verificar automaticamente as horas
            ocupadas e os novos eventos à medida em que são agendados.
          </Text>

          <MultiStep size={4} currentStep={3}></MultiStep>
        </Header>

        <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
          <IntervalContainer>
            {fields.map((field, fieldIndex) => {
              return (
                <IntervalItem key={field.id}>
                  <IntervalDay>
                    {/* Controller é um componente que detém o controle de elementos não nativos do HTML, no caso o Checkbox que é uma dive e não um input */}
                    <Controller
                      name={`intervals.${fieldIndex}.enabled`} // Qual campo do formulário vai ser manipulado
                      control={control} // Config para ele entender qual formulário está sendo manipulado
                      // render = componente não nativo do HTML padrão a ser manipulado
                      render={({ field }) => {
                        return (
                          <Checkbox
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true)
                            }}
                            checked={field.value}
                          />
                        )
                      }}
                    />

                    <Text>{weekDays[field.weekDay]}</Text>
                  </IntervalDay>

                  <IntervalInputs>
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      disabled={intervals[fieldIndex].enabled === false}
                      {...inputConfig}
                      {...register(`intervals.${fieldIndex}.startTime`)}
                    />
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      disabled={intervals[fieldIndex].enabled === false}
                      {...inputConfig}
                      {...register(`intervals.${fieldIndex}.endTime`)}
                    />
                  </IntervalInputs>
                </IntervalItem>
              )
            })}
          </IntervalContainer>

          {errors?.intervals?.root && (
            <FormError size="sm">{errors.intervals.root.message}</FormError>
          )}

          <Button type="submit" disabled={isSubmitting}>
            Próximo Passo
            <ArrowRight />
          </Button>
        </IntervalBox>
      </Container>
    </>
  )
}
