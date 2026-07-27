# Tarefas — gerenciador de tarefas e hábitos

App estilo Todoist para organização pessoal, com:

- **Tarefas**: projetos, prioridades, datas/horários de vencimento
- **Recorrência**: diária, dias úteis, semanal (dias específicos) e mensal
- **Hábitos**: acompanhamento de frequência, sequência (streak) e histórico dos últimos 7 dias
- **Calendário mensal** com visualização das tarefas por dia
- **Lembretes** via notificações do navegador
- **Modo escuro**

Dados são salvos localmente no navegador (localStorage) — não há backend.

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
