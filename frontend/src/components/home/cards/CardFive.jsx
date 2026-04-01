import CustomCard from '../../card/CustomCard';

const CardFive = () => {
    return (
        <>
            <CustomCard
                title="Etiquetá bien">
                <img src='/images/ImageCardFive.png' className='img-fluid mb-4' />
                <p className='title-card text-center'>
                    Una etiqueta clara y visible es vital para que el paquete llegue sin problemas a su destino. Debe incluir la dirección completa del destinatario, con calle, número, código postal, ciudad y país si es necesario. También debe contener la dirección del remitente para facilitar devoluciones si hay problemas. Si el contenido es delicado, es recomendable añadir etiquetas como “Frágil”, “No apilar”, “Este lado arriba” o “Manéjese con cuidado” para alertar a quienes manipulen el paquete y garantizar un trato adecuado, reduciendo la posibilidad de daños.
                </p>

            </CustomCard>
        </>
    );
};

export default CardFive;