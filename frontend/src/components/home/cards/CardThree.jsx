import CustomCard from '../../card/CustomCard';

const CardThree = () => {
    return (
        <>
            <CustomCard
                title="Rellená los huecos">
                <p className='title-card text-center'>
                    <img src='/images/ImageCardThree.png' className='img-fluid mb-4' />
                    Eliminar espacios vacíos dentro de la caja es crucial para que el contenido no se mueva durante el transporte, lo que podría causar daños. Para rellenar esos huecos se pueden usar materiales como papel arrugado, bolsas de aire infladas, cacahuates de embalaje o espuma de relleno. Estos materiales fijan los objetos, amortiguan impactos y evitan que choquen contra las paredes internas de la caja. De este modo, se consigue un embalaje firme y seguro, reduciendo considerablemente el riesgo de daños y asegurando que el contenido llegue intacto.
                </p>

            </CustomCard>
        </>
    );
};

export default CardThree;