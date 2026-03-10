"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Patient, api } from "@/lib/api"
import { professionals as mockProfessionals } from "@/lib/mock-data"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  professional: z.string().min(1, "Selecione um profissional"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  duration: z.coerce.number().min(5, "Duração mínima de 5 minutos"),
  type: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  defaultDate?: string
}

export function AppointmentForm({ onSubmit, onCancel, isLoading, defaultDate }: AppointmentFormProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isFetchingPatients, setIsFetchingPatients] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.getPatients()
        setPatients(response.data)
      } catch (error) {
        console.error("Failed to fetch patients:", error)
      } finally {
        setIsFetchingPatients(false)
      }
    }
    fetchPatients()
  }, [])

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: "",
      professional: "",
      date: defaultDate || new Date().toISOString().split('T')[0],
      time: "09:00",
      duration: 30,
      type: "Consulta",
      notes: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    {isFetchingPatients ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="professional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profissional</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockProfessionals.map((prof) => (
                      <SelectItem key={prof} value={prof}>
                        {prof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Consulta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Avaliação" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (min)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notas internas sobre a consulta..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Confirmar Agendamento"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
