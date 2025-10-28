import Swal from "sweetalert2";
import type { SweetAlertOptions } from "../types/sweetAlert";

export const showError = ({
  icon = "error",
  title,
  text,
  confirmButtonText,
}: SweetAlertOptions) => {
  return Swal.fire({
    icon,
    title,
    text,
    confirmButtonText,
    customClass: {
      confirmButton:
        "!bg-red-600 text-white !font-bold px-6 py-3 rounded hover:!bg-red-700",
    },
  });
};
