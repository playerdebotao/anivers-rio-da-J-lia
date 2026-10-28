window.CONFIG = {
    nome: "Júlia",

    // TELA INICIAL
    tituloIntro: "Eu nunca esqueceria seu aniversário😎🤠",
    subtituloIntro: "Feliz aniversário, Júlia Deolindo Lima... Esse é meu jeito de te mostrar o quanto você é especial.",
    botaoIntro: "Entrar no universo Júlia",

    // TRILHA SONORA
    // Os caminhos precisam corresponder aos nomes reais dos arquivos.
    // volume: 0 = mudo | 0.5 = 50% | 1 = 100%.
    trilhaSonora: [
        {
            titulo: "Stand By Me - Ben E. King",
            arquivo: "musicas/musica1.mp3",
            volume: 0.2
        },
        {
            titulo: "2 Much - Justin Bieber",
            arquivo: "musicas/musica2.mp3",
            volume: 0.2
        },
        {
            titulo: "Vienna - Billy Joel",
            arquivo: "musicas/musica3.mp3",
            volume: 0.2
        }
    ],

    // Compatibilidade com uma única música antiga.
    musica: "musicas/musica1.mp3",

    // METEORO
    meteoro: {
        ativo: true,
        intervaloMin: 12,
        intervaloMax: 20,
        titulo: "Uma estrela cadente pra você",
        texto: "Até o universo encontra um jeito de lembrar o quanto você é especial. ✨"
    },

    // SOL — FOTO CENTRAL
    sol: {
        foto: "FOTOS/FotoDoSol.png",
        fotoPosicao: { x: 60, y: 30 },
        titulo: "Júlia, Você é incrível e merece o universo inteiro",
        texto: "Você brinca as vezes falando que o mundo gira em torno de você (a gente sabe que não)... mas através dessas linhas de códigos, eu consigo fazer o universo girar em torno de você."
    },

    // PLANETAS — FOTOS E MENSAGENS
    planetas: [
        { foto: "FOTOS/Foto1.png", fotoPosicao: { x: 50, y: 50 }, titulo: "Você pode não gostar dessa foto, mas eu amo ela kkkkkkkkk", texto: "Nesse dia tinha acabado o jogo da copa (se eu não me engano).\nAli foi a primeira vez que você usou meu casaco." },
        { foto: "FOTOS/Foto2.png", fotoPosicao: { x: 50, y: 25 }, titulo: "Acho que essa foto você vai gostar do que a outra", texto: "É impossível não olhar para essa foto e não lembrar da pizza que todo mundo comeu ali kkkkkkkk nesse dia a gente tinha combinado de ir naquela praça da luz amarela." },
        { foto: "FOTOS/Foto3.png", fotoPosicao: { x: 50, y: 50 }, titulo: "Já falei que sou apaixonado no seu olhar?", texto: "Uma das coisas que mais me deixou preso em você foi seu olhar." },
        { foto: "FOTOS/Foto4.png", fotoPosicao: { x: 50, y: 15 }, titulo: "Tenho quase certaza que foi a primeira vez nossa na praça", texto: "Eu nunca vou esquecer de nenhum momento que passei do seu lado nesse tempo, cada risada, cada conversa séria e cada vez que você me forçou a comer algo que nem criança...." },
        { foto: "FOTOS/Foto5.png", fotoPosicao: { x: 50, y: 50 }, titulo: "O que você estava linda aqui é absrudo, ta? ta doido", texto: "Sei que pode parecer estranho isso tudo que fiz, mas como você mesmo disse uma vez para mim: você não pode esquecer meu aniversário.\nE eu nunca esqueceria seu aniversário, nem se eu quisesse muito" }
    ],

    // FRASES QUE FLUTUAM PELO ESPAÇO
    frases: [
        "Feliz Aniversário❤️",
        "Cânticos 4:7",
        "Teimosa",
        "inteligente",
        "O universo de linhas de códigos só para você",
        "Atenciosa",
        "Carinhosa",
        "Linda",
        "Amorosa",
        "Feliz Aniversário, Júlia Deolindo Lima"
    ]
};
