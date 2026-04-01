import CustomCard from '../../card/CustomCard';

const CardTwo = () => {
  return (
    <>
      <CustomCard
        title="Protegé el contenido">
        <img src='/images/ImageCardTwo.png' className='img-fluid mb-4' />
        <p className='title-card text-center'>
          Proteger cada objeto dentro del paquete es esencial para evitar daños causados por golpes, vibraciones o aplastamientos durante el transporte. Es aconsejable envolver individualmente cada objeto con materiales acolchados, como plástico de burbujas, papel kraft o espuma, que amortiguan impactos. Los objetos frágiles, como vidrio, cerámica o electrónicos, deben tener varias capas de protección para minimizar riesgos. También se recomienda usar separadores o divisores dentro de la caja para evitar que los objetos choquen entre sí, asegurando que lleguen en perfecto estado al destinatario.
        </p>

      </CustomCard>
    </>
  );
};

export default CardTwo;