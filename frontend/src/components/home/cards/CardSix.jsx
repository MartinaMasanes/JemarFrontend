import CustomCard from '../../card/CustomCard';

const CardSix = () => {
    return (
        <>
            <CustomCard
                title="Evitá sobrecarga">
                <img src='/images/ImageCardSix.png' className='img-fluid mb-4' />
                <p className='title-card text-center'>
                    Cada caja tiene un límite de peso que puede soportar sin romperse o dañarse. Sobrecargarla puede causar que se rompa, aplaste el contenido o se abra durante el transporte. Para paquetes muy pesados, es mejor usar cajas especiales diseñadas para cargas pesadas o dividir el contenido en varias cajas más pequeñas y manejables. Además, muchas empresas de transporte imponen límites de peso para garantizar la seguridad y facilitar la manipulación. Respetar estos límites evitará problemas, multas o el rechazo del paquete.
                </p>
            </CustomCard>
        </>
    );
};

export default CardSix;