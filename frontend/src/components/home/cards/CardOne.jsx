import CustomCard from '../../card/CustomCard';

const CardOne = () => {
  return (
    <>
      <CustomCard
        title="Elegí la caja adecuada">
        <img src='/images/ImageCardOne.png' className='img-fluid mb-4' />
        <p className='title-card text-center'>
          La caja es la primera barrera para proteger tu paquete durante todo el proceso de transporte. Debe ser resistente, estar en buen estado y tener un tamaño adecuado para el contenido. Una caja demasiado grande puede permitir que los objetos se muevan, aumentando el riesgo de daños; una muy pequeña puede aplastar el contenido o dificultar un cierre seguro. Para objetos pesados o voluminosos, es recomendable usar cajas reforzadas, como las de cartón doble o con materiales especiales que soporten mejor el peso y las condiciones del manejo. Evita cajas viejas, dobladas o dañadas, ya que su resistencia se reduce y podrían romperse fácilmente, poniendo en riesgo el contenido.
        </p>
      </CustomCard>
    </>
  );
};

export default CardOne;