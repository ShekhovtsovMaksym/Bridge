package com.example.demo.controller;

import com.example.demo.dto.AddressRequest;
import com.example.demo.dto.AddressResponse;
import com.example.demo.dto.MessageResponse;
import com.example.demo.model.Address;
import com.example.demo.model.User;
import com.example.demo.repository.AddressRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "*")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<?> getAddresses(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found"));
            }
            
            User user = userOpt.get();
            List<Address> addresses = addressRepository.findByUser(user);
            
            List<AddressResponse> response = addresses.stream().map(addr -> {
                AddressResponse resp = new AddressResponse();
                resp.setId(addr.getId());
                resp.setUid(addr.getUid());
                resp.setAddressName(addr.getAddressName());
                resp.setCountry(addr.getCountry());
                resp.setCity(addr.getCity());
                resp.setZipCode(addr.getZipCode());
                resp.setAddress(addr.getAddress());
                resp.setAddressDetails(addr.getAddressDetails());
                resp.setPhoneNumber(addr.getPhoneNumber());
                resp.setContactPerson(addr.getContactPerson());
                return resp;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAddress(@RequestHeader("Authorization") String authHeader,
                                          @RequestBody AddressRequest request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found"));
            }
            
            User user = userOpt.get();
            
            Address address = new Address();
            address.setUser(user);
            address.setAddressName(request.getAddressName());
            address.setCountry(request.getCountry());
            address.setCity(request.getCity());
            address.setZipCode(request.getZipCode());
            address.setAddress(request.getAddress());
            address.setAddressDetails(request.getAddressDetails());
            address.setPhoneNumber(request.getPhoneNumber());
            address.setContactPerson(request.getContactPerson());
            
            Address saved = addressRepository.save(address);
            
            AddressResponse response = new AddressResponse();
            response.setId(saved.getId());
            response.setUid(saved.getUid());
            response.setAddressName(saved.getAddressName());
            response.setCountry(saved.getCountry());
            response.setCity(saved.getCity());
            response.setZipCode(saved.getZipCode());
            response.setAddress(saved.getAddress());
            response.setAddressDetails(saved.getAddressDetails());
            response.setPhoneNumber(saved.getPhoneNumber());
            response.setContactPerson(saved.getContactPerson());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@RequestHeader("Authorization") String authHeader,
                                          @PathVariable Long id,
                                          @RequestBody AddressRequest request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found"));
            }
            
            Optional<Address> addressOpt = addressRepository.findById(id);
            if (addressOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Address not found"));
            }
            
            Address address = addressOpt.get();
            
            // Check if address belongs to the user
            if (!address.getUser().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
            }
            
            address.setAddressName(request.getAddressName());
            address.setCountry(request.getCountry());
            address.setCity(request.getCity());
            address.setZipCode(request.getZipCode());
            address.setAddress(request.getAddress());
            address.setAddressDetails(request.getAddressDetails());
            address.setPhoneNumber(request.getPhoneNumber());
            address.setContactPerson(request.getContactPerson());
            
            Address saved = addressRepository.save(address);
            
            AddressResponse response = new AddressResponse();
            response.setId(saved.getId());
            response.setUid(saved.getUid());
            response.setAddressName(saved.getAddressName());
            response.setCountry(saved.getCountry());
            response.setCity(saved.getCity());
            response.setZipCode(saved.getZipCode());
            response.setAddress(saved.getAddress());
            response.setAddressDetails(saved.getAddressDetails());
            response.setPhoneNumber(saved.getPhoneNumber());
            response.setContactPerson(saved.getContactPerson());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@RequestHeader("Authorization") String authHeader,
                                          @PathVariable Long id) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found"));
            }
            
            Optional<Address> addressOpt = addressRepository.findById(id);
            if (addressOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Address not found"));
            }
            
            Address address = addressOpt.get();
            
            // Check if address belongs to the user
            if (!address.getUser().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
            }
            
            addressRepository.delete(address);
            
            return ResponseEntity.ok(new MessageResponse("Address deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
