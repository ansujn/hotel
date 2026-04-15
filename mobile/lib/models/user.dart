class User {
  final String id;
  final String phone;
  final String? email;
  final String? name;
  final String role;

  const User({
    required this.id,
    required this.phone,
    required this.role,
    this.email,
    this.name,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String?,
      name: json['name'] as String?,
      role: (json['role'] as String?) ?? 'student',
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'phone': phone,
        'email': email,
        'name': name,
        'role': role,
      };
}
