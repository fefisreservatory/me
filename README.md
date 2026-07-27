# Tarefas — gerenciador de tarefas e hábitos

App estilo Todoist para organização pessoal, com:

- **Tarefas**: projetos, prioridades, datas/horários de vencimento
- **Recorrência**: diária, dias úteis, semanal (dias específicos) e mensal
- **Hábitos**: acompanhamento de frequência, sequência (streak) e histórico dos últimos 7 dias
- **Calendário mensal** com visualização das tarefas por dia
- **Lembretes** via notificações do navegador
- **Modo escuro**
- **PWA instalável** (funciona como app no iPhone/iOS e Android)

Dados são salvos localmente no navegador (localStorage) — não há backend.

## Instalando no iPhone (iOS)

1. Acesse o app publicado no **Safari** (precisa ser Safari, não funciona pelo app de outro navegador).
2. Toque no ícone de compartilhar (quadrado com seta para cima).
3. Escolha **"Adicionar à Tela de Início"**.
4. O app abre em tela cheia, com ícone próprio, como um app nativo.

**Sobre lembretes no iOS**: as notificações funcionam enquanto o app está aberto em primeiro plano. Notificações com o app fechado exigiriam um servidor de push (Web Push), que este projeto não inclui por não ter backend.

## Rodando o projeto

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Stack

React + TypeScript + Vite, Zustand (estado + persistência), Tailwind CSS v4, date-fns, lucide-react.
