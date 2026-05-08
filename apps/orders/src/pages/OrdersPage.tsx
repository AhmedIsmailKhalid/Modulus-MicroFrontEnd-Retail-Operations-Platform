import { ToastContainer, useToast } from "@modulus/ui";
import type { Order } from "@modulus/types";

import { useOrders } from "../hooks/useOrders";
import { useOrdersStore } from "../store/ordersStore";
import { OrderFilters } from "../components/OrderFilters";
import { OrderTable } from "../components/OrderTable";
import { OrderDetail } from "../components/OrderDetail";
import { UpdateStatusModal } from "../components/UpdateStatusModal";

export function OrdersPage() {
  const { isDetailOpen, openStatusModal } = useOrdersStore();
  const { refetch } = useOrders();
  const toast = useToast();

  function handleSuccess(_order: Order, message: string) {
    toast.success(message);
    void refetch();
  }

  function handleError(message: string) {
    toast.error(message);
  }

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="orders-page">
      {isDetailOpen ? (
        /* Detail view */
        <OrderDetail onUpdateStatus={openStatusModal} />
      ) : (
        /* List view */
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Manage customer orders and fulfilment status.
              </p>
            </div>
          </div>

          <OrderFilters />
          <OrderTable />
        </>
      )}

      <UpdateStatusModal onSuccess={handleSuccess} onError={handleError} />
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
    </div>
  );
}
