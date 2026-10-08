import { useQuery, useMutation } from '@tanstack/react-query';
import { addressService } from '@services/address.service';
import { Address } from '@models/address';

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAddresses(),
  });
}

export function useAddAddress() {
  return useMutation({
    mutationFn: (data: Omit<Address, 'id'>) => addressService.addAddress(data),
  });
}
