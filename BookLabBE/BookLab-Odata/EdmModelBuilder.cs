using BookLabModel.Model;
using Microsoft.OData.Edm;
using Microsoft.OData.ModelBuilder;

namespace BookLab_Odata
{
    public class EdmModelBuilder
    {
        public static IEdmModel GetEdmModel()
        {
            var modelBuilder = new ODataConventionModelBuilder();
            modelBuilder.EntitySet<Role>("Roles");
            modelBuilder.EntitySet<Account>("Accounts");
            modelBuilder.EntitySet<AccountDetail>("AccountDetails");
            modelBuilder.EntitySet<Booking>("Bookings");
            modelBuilder.EntitySet<Building>("Buildings");
            modelBuilder.EntitySet<Campus>("Campuses");
            modelBuilder.EntitySet<CategoryRoom>("CategoryRooms");
            modelBuilder.EntitySet<Feedback>("Feedbacks");
            modelBuilder.EntitySet<Group>("Groups");
            modelBuilder.EntitySet<GroupInBooking>("GroupInBookings");
   


            modelBuilder.EntitySet<ImageRoom>("ImageRooms");
            modelBuilder.EntitySet<Room>("Rooms");
            modelBuilder.EntitySet<SubBooking>("SubBookings");
            //modelBuilder.EntitySet<StudentInBooking>("StudentInBookings");
            modelBuilder.EntitySet<StudentInGroup>("StudentInGroups");
            //modelBuilder.EntitySet<FavouriteRoom>("FavouriteRooms");


            return modelBuilder.GetEdmModel();
        }
    }
}
