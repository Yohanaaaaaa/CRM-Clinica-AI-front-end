import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as configurações da sua clínica e do Agente IA.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações da Clínica</CardTitle>
            <CardDescription>
              Dados básicos que aparecem nos orçamentos e comunicações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Clínica</Label>
              <Input id="name" defaultValue="ClinicAI Reabilitação" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email de Contato</Label>
              <Input id="email" defaultValue="contato@clinicaai.com" />
            </div>
            <Button size="sm">Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agente IA (WhatsApp)</CardTitle>
            <CardDescription>
              Configure o comportamento do seu assistente virtual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Agendamento Automático</Label>
                <p className="text-xs text-muted-foreground">
                  Permitir que a IA marque consultas sozinha no Google Calendar.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembretes de 24h</Label>
                <p className="text-xs text-muted-foreground">
                  Enviar lembrete via WhatsApp um dia antes da consulta.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo de Triagem</Label>
                <p className="text-xs text-muted-foreground">
                  A IA deve fazer perguntas pré-definidas antes de agendar.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
