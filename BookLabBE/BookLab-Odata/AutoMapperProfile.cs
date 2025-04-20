using AutoMapper;
using BookLabDTO;
using BookLabModel.Model;

namespace BookLab_Odata
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile() 
        {
            CreateMap<Feedback, FeedBackDTO>().ForMember(f => f.AccountName, o => o.MapFrom(src => src.Lecturer != null ? src.Lecturer.AccountName : ""))
                                              .ForMember(f => f.Avatar, o => o.MapFrom(src => src.Lecturer.AccountDetail != null ? src.Lecturer.AccountDetail.Avatar : "" ));
        }
    }
}
