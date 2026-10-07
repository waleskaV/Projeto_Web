const mongoose =
    require('mongoose');


const conectarBanco =
async () => {

    try {

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            'MongoDB conectado com sucesso!'
        );

    } catch (error) {

        console.error(
            'Erro ao conectar ao MongoDB:',
            error.message
        );

        throw error;

    }

};


module.exports =
    conectarBanco;