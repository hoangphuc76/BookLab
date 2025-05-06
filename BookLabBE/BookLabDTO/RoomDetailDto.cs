using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class RoomDetailDTO
    {
        public Guid Id { get; set; }
        
        public string? Name { get; set; }
        
        public string? CategoryName { get; set; }
        
        public string? CampusName { get; set; }
        
        public string? ManagerAvatar { get; set; }
        public string? Avatar { get; set; }

        public string? ManagerName { get; set; }
        
        public double? Rating { get; set; }
        
        public int? Capacity { get; set; }
        
        public int? GroupSize { get; set; }
        
        public bool? OnlyGroupStatus { get; set; }
        
    }
}