import React from "react";
import Slider from "@ant-design/react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Settings } from "react-slick";
import SectionContainer from "../common/SectionContainer";
import SectionTitle from "../common/SectionTitle";

const ListBestComment: React.FC = () => {
  const settings: Settings = {
    dots: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const testimonials = [
    {
      name: "Anh Nguyễn Tuấn Quỳnh",
      role: "CEO Saigon Books",
      image: "https://229a2c9fe669f7b.cmccloud.com.vn/images/testimonial-quynh.jpg",
      comment:
        "Lần trước tôi có việc gấp phải đi công tác, lên mạng tìm đặt vé xe thì tình cờ tìm thấy BusBooker. Sau khi tham khảo, tôi quyết định đặt vé và thanh toán. Công nhận rất tiện và nhanh chóng. Chỉ một lúc sau, nhà xe liên hệ xác nhận vé ngay và thông báo thời gian xe dự kiến đón để tôi chuẩn bị. Tôi khá bất ngờ vì nhà xe có thông tin của mình nhanh đến vậy. Chuyến đi hôm đó rất tuyệt. Tôi nhất định sẽ tiếp tục ủng hộ BusBooker.",
    },
    {
      name: "Shark Phi",
      role: "Giám đốc BSSC",
      image: "https://229a2c9fe669f7b.cmccloud.com.vn/images/testimonial-phi.jpg",
      comment:
        "Các đối tác của BusBooker đều là những hãng xe lớn, có uy tín nên tôi hoàn toàn yên tâm khi lựa chọn đặt vé cho bản thân và gia đình. Nhờ hiển thị rõ nhà xe và vị trí chỗ trống trên xe, tôi rất dễ dàng tìm chuyến mình muốn và chỗ mình muốn ngồi. Còn hình thức thanh toán có cả thẻ, ví, tại nhà xe và tốc độ thanh toán thì siêu nhanh, tiết kiệm cho tôi rất nhiều thời gian.",
    },
    {
      name: "Chị Tú Ngô",
      role: "YOLA Co-Founder",
      image: "https://229a2c9fe669f7b.cmccloud.com.vn/images/testimonial-tu-ngo.jpg",
      comment:
        "BusBooker là ứng dụng đầu tiên tôi nghĩ tới khi cần đặt vé xe. Vì không những BusBooker có nhiều ưu đãi lớn mà còn có nhiều hãng xe chất lượng, tôi được tuỳ chọn chỗ yêu thích nên tôi rất hài lòng.",
    },
    {
      name: "Bữu Vi Vu",
      role: "Travel tiktoker",
      image: "https://229a2c9fe669f7b.cmccloud.com.vn/images/testimonial-buuvivu.jpg",
      comment:
        "Tôi thường chọn đặt vé tại BusBooker mỗi khi du lịch cùng người thân, bạn bè. Bên cạnh việc đặt vé nhanh chóng, thuận tiện, BusBooker còn có các đợt Flashsale định kỳ lên đến 50%. Săn vé thành công vào các dịp này giúp tôi tiết kiệm đáng kể chi phí đi lại cho mỗi chuyến đi.",
    },
  ];

  return (
    <SectionContainer>
      <SectionTitle>Khách hàng nói gì về BusBooker</SectionTitle>
      <Slider {...settings}>
        {testimonials.map((testimonial, index) => (
          <div key={index} className="p-2 h-[362px] max-md:h-[440px]">
            <table className="border-gray-100 rounded-lg shadow border-2 h-full">
              <tbody>
                <tr>
                  <td className="p-4 max-md:p-4">
                    <div className="max-md:flex max-md:gap-4 max-md:items-center">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="max-md:w-40 max-md:h-28 object-cover w-48 h-48 object-top"
                      />
                      <div>
                        <p className="max-md:inline max-md:text-xl font-bold mt-2 text-2xl w-48 text-blue-600">
                          {testimonial.name}
                        </p>
                        <p className="text-gray-600 font-bold max-md:text-md text-lg mt-2">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="md:hidden mt-4">{testimonial.comment}</p>
                  </td>
                  <td className="align-top p-4 max-md:p-10 max-md:hidden">
                    <p>{testimonial.comment}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </Slider>
    </SectionContainer>
  );
};

export default ListBestComment;

