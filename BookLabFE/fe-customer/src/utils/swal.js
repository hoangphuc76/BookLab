import Swal from 'sweetalert2';

const swToastInstance = Swal.mixin({
    position: 'top',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    toast: true
});


export const swalert = Swal.mixin({
    confirmButtonText: '<i class="fas fa-check"></i> Chấp nhận',
    cancelButtonText: '<i class="fas fa-xmark"></i> Hủy bỏ'
});

export const swtoast = {
    fire(config) {
        swToastInstance.fire({
            ...config,
            toast: true
        });
    },

    success(config) {
        swToastInstance.fire({
            ...config,
            icon: 'success',
            toast: true
        });
    },

    error(config) {
        swToastInstance.fire({
            icon: 'error',
            ...config,
            color: '#f00',
            toast: true
        });
    },
    warning(config) {
        swToastInstance.fire({
            icon: 'warning',
            ...config,
            toast: true,
            allowOutsideClick: true,
            timer: 5000,

        })

    }

};
export const swConfirmDelete = (onConfirm, contextConfirm, contextComplete) => Swal.fire({
    title: "Are you sure?",
    text: `You will remove ${contextConfirm} and won't be able to revert this!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
}).then(async (result) => {
    if (result.isConfirmed) {
        await onConfirm();

    }
});

export const swConfirmBooking = (onConfirm, contextConfirm, contextComplete) => Swal.fire({
    title: "Do you want to booking?",
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Book it!"
}).then(async (result) => {
    if (result.isConfirmed) {
        await onConfirm();
    }
});
