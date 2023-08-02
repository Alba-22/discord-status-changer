# Discord Status Changer

<img src="./discord_banner.png"/>

Apenas um simples projeto para mudar o status do meu discord automaticamente nos momentos em que eu estiver em aula na faculdade.

Para tal, foi criada uma Cloud Function do Firebase que é disparada a cada 10 minutos e verifica em uma lista se a data e hora atuais coincidem com um horário de aula meu. Caso sim, é chamado um endpoint do discord para alterar o status para "Não perturbe" e colocar uma mensagem "Em aula". Esse status durará até o fim da aula em questão.
