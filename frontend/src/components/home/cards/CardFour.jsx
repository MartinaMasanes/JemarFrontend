import CustomCard from '../../card/CustomCard';

const CardFour = () => {
    return (
        <>
            <CustomCard
                title="Cerrá con cinta">
                <img src='/images/ImageCardFour.png' className='img-fluid mb-4' />
                <p className='title-card text-center'>
                    El cierre correcto de la caja es fundamental para que el paquete no se abra accidentalmente durante el transporte. Se debe usar cinta adhesiva fuerte y adecuada para embalaje, que resista movimientos bruscos y manipulaciones diversas. Es importante cubrir bien todas las aberturas, especialmente uniones y esquinas, que son las zonas más vulnerables. La cinta ancha o reforzada es la mejor opción porque ofrece mayor adherencia y durabilidad. Evita cintas débiles o poco adhesivas para asegurar la integridad del paquete hasta su destino final.
                </p>

            </CustomCard>
        </>
    );
};

export default CardFour;